import { Request, Response } from "express";
import FavoriteCourse from "../models/FavoriteCourse";
import User from "../models/User";
import validator from "email-validator";
import UserIdentity from "../models/UserIdentity";
import { cnpj, cpf } from "cpf-cnpj-validator";
import { transporter } from "../utils/nodemailer";

export async function get(req: Request, res: Response) {
  try {
    const { id } = req.body;

    const user = await User.findById(id);

    res.json(user);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function read(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(203).json({
        error: true,
        message: "id is missing",
      });
    }

    const user = await User.findOne({ id }).lean();

    return res.json(user);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function intro(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    const payload = {
      config: {
        introVisualized: true,
      },
    };

    await User.findByIdAndUpdate(
      userId,
      payload,
      { useFindAndModify: true, new: true },
      function (err: any, docs: any) {
        if (err) {
          return res.json({ error: true, message: "falhou no mongoose" });
        } else {
          return res.json({
            message: "Atualizado com sucesso",
            user: docs,
          });
        }
      }
    )
      .clone()
      .catch((error: any) => {
        return res.json({ error: true, message: "falhou no mongoose" });
      });
  } catch (e) {}
}

export async function isCourseFavorited(req: Request, res: Response) {
  try {
    const { userId, courseId } = req.params;

    const favorites = await FavoriteCourse.findOne({
      userId,
      courseId,
    });

    return res.json(favorites);
  } catch (e) {}
}

export async function favoriteCourse(req: Request, res: Response) {
  try {
    const { userId, courseId } = req.body;

    const favorited = await FavoriteCourse.findOne({
      userId,
      courseId,
    });

    if (favorited) {
      await FavoriteCourse.findOneAndDelete({
        userId,
        courseId,
      });

      return res.json({
        status: "Curso desfavoritado com sucesso!",
      });
    } else {
      const favorite_course = new FavoriteCourse({
        courseId,
        userId,
      });
      await favorite_course.save();

      return res.json({
        status: "Curso favoritado com sucesso!",
        favorite_course,
      });
    }
    // await User.findByIdAndUpdate(
    //   userId,
    //   payload,
    //   { useFindAndModify: true, upsert: true },
    //   function (err: any, docs: any) {
    //     if (err) {
    //       return res.json({ error: true, message: "falhou no mongoose" });
    //     } else {
    //       return res.json({
    //         message: "Atualizado com sucesso",
    //         user: docs,
    //       });
    //     }
    //   }
    // )
    //   .clone()
    //   .catch((error: any) => {
    //     return res.json({ error: true, message: "falhou no mongoose" });
    //   });
  } catch (e) {
    return res.status(500).json({ status: "Erro!", error: e });
  }
}

export async function isUsernameAvailable(req: Request, res: Response) {
  try {
    const { username } = req.body;

    const exists = await User.findOne({
      username,
    });

    if (exists) {
      return res.json(false);
    } else {
      return res.json(true);
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function isEmailAvailable(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const exists = await User.findOne({
      email,
    });

    if (exists) {
      return res.json(false);
    } else {
      if (!validator.validate(email)) {
        return res.json(false);
      }

      return res.json(true);
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function getByEmail(req: Request, res: Response) {
  try {
    const { email } = req.params;

    const exists = await User.findOne({
      email,
    });

    if (exists) {
      return res.json(exists);
    } else {
      return res.json(false);
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    await User.updateOne({ _id: userId }, { $set: req.body }, { new: true });

    return res.status(200).json("User atualizado com sucesso");
  } catch (e) {}
}

export async function updateIdentityEntity(req: Request, res: Response) {
  try {
    const { userId, entity } = req.params;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    if (entity !== "cnpj" && entity !== "cpf") {
      return res.status(203).json("Entidade nÃ£o existe");
    }

    const userIdentity = await UserIdentity.findOne({ userId: user._id });

    if (!userIdentity) {
      const newUserIdentity = new UserIdentity({
        userId: user._id,
        entity,
      });

      await newUserIdentity.save();

      return res.status(200).json("Entidade do usuÃ¡rio atualizado com sucesso");
    } else {
      await UserIdentity.updateOne(
        { userId },
        {
          $set: {
            entity,
          },
        },
        { new: true }
      );

      return res.status(200).json("Entidade do usuÃ¡rio atualizado com sucesso");
    }
  } catch (e) {}
}

export async function updateIdentityData(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { fullName, document, birthday, phoneNumber } = req.body;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    if (!fullName.split(" ")[1]) {
      return res.status(203).json("Nome InvÃ¡lido.");
    }

    if (!birthday) {
      return res.status(203).json("Data de nascimento InvÃ¡lido.");
    }

    if (String(phoneNumber).length < 9) {
      return res.status(203).json("NÃºmero de telefone InvÃ¡lido.");
    }

    const userIdentity = await UserIdentity.findOne({
      userId: user._id,
    }).lean();

    if (userIdentity) {
      const isValidCNPJ = cnpj.isValid(document);
      const isValidCPF = cpf.isValid(document);

      if (!isValidCNPJ && !isValidCPF) {
        return res.status(203).json(`Documento InvÃ¡lido.`);
      }

      await UserIdentity.updateOne(
        { userId },
        {
          $set: {
            fullName,
            birthday,
            document,
            phoneNumber,
          },
        },
        { new: true }
      );

      return res.status(200).json("Entidade do usuÃ¡rio atualizado com sucesso");
    } else {
      return res.status(203).json("User Identity nÃ£o existe");
    }
  } catch (e) {}
}

export async function updateIdentityAddress(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const {
      address,
    }: {
      address: {
        address: string;
        zipCode: string;
        neighborhood: string;
        city: string;
        state: string;
        number: string;
      };
    } = req.body;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    if (!address) {
      return res.status(203).json("EndereÃ§o InvÃ¡lido.");
    }

    if (!address.address) {
      return res.status(203).json("EndereÃ§o InvÃ¡lido.");
    }

    if (!address.zipCode) {
      return res.status(203).json("ZipCode InvÃ¡lido.");
    }

    if (!address.neighborhood) {
      return res.status(203).json("Bairro InvÃ¡lido.");
    }

    if (!address.city) {
      return res.status(203).json("Cidade InvÃ¡lida.");
    }

    if (!address.number) {
      return res.status(203).json("NÃºmero InvÃ¡lido.");
    }

    if (!address.state) {
      return res.status(203).json("Estado InvÃ¡lido.");
    }

    if (address.state.length > 2) {
      return res.status(203).json("Estado InvÃ¡lido.");
    }

    const userIdentity = await UserIdentity.findOne({
      userId: user._id,
    }).lean();

    if (userIdentity) {
      await UserIdentity.updateOne(
        { userId },
        {
          $set: {
            address,
          },
        },
        { new: true }
      );

      return res.status(200).json("Entidade do usuÃ¡rio atualizado com sucesso");
    } else {
      return res.status(203).json("User Identity nÃ£o existe");
    }
  } catch (e) {}
}

export async function updateIdentitySelfie(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { selfieURL } = req.body;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    if (!selfieURL) {
      return res.status(203).json("URL InvÃ¡lido.");
    }

    const userIdentity = await UserIdentity.findOne({
      userId: user._id,
    }).lean();

    if (userIdentity) {
      await UserIdentity.updateOne(
        { userId },
        {
          $set: {
            selfieURL,
          },
        },
        { new: true }
      );

      return res.status(200).json("Selfie do usuÃ¡rio atualizado com sucesso");
    } else {
      return res.status(203).json("User Identity nÃ£o existe");
    }
  } catch (e) {}
}

export async function updateIdentityIdFront(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { frontIdURL } = req.body;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    if (!frontIdURL) {
      return res.status(203).json("URL InvÃ¡lido.");
    }

    const userIdentity = await UserIdentity.findOne({
      userId: user._id,
    }).lean();

    if (userIdentity) {
      await UserIdentity.updateOne(
        { userId },
        {
          $set: {
            frontIdURL,
          },
        },
        { new: true }
      );

      return res
        .status(200)
        .json("Frente da Identidade do usuÃ¡rio atualizada com sucesso");
    } else {
      return res.status(203).json("User Identity nÃ£o existe");
    }
  } catch (e) {}
}

export async function updateIdentityIdBack(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { backIdURL } = req.body;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    if (!backIdURL) {
      return res.status(203).json("URL InvÃ¡lido.");
    }

    const userIdentity = await UserIdentity.findOne({
      userId: user._id,
    }).lean();

    if (userIdentity) {
      await UserIdentity.updateOne(
        { userId },
        {
          $set: {
            backIdURL,
          },
        },
        { new: true }
      );

      return res
        .status(200)
        .json("Verso da Identidade do usuÃ¡rio atualizado com sucesso");
    } else {
      return res.status(203).json("User Identity nÃ£o existe");
    }
  } catch (e) {}
}

export async function updateIdentityComplete(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    const userIdentity = await UserIdentity.findOne({
      userId: user._id,
    }).lean();

    if (userIdentity) {
      if (
        userIdentity.address &&
        userIdentity.backIdURL &&
        userIdentity.frontIdURL &&
        userIdentity.selfieURL &&
        userIdentity.entity &&
        userIdentity.document &&
        userIdentity.phoneNumber
      ) {
        await UserIdentity.updateOne(
          { userId },
          {
            $set: {
              status: "complete",
            },
          },
          { new: true }
        );
        await transporter.sendMail({
          from: "Membros <suporte@membros.me>", // sender address
          to: ["suporte@membros.me"], // list of receivers
          subject: "Pedido de Verificação", // Subject line
          html: `<div style="margin-top: 20px;margin-bottom: 20px;border-radius: 5px; padding: 10px;background: #EEE"><p>Id do Usuário: ${user._id}</p></div>`,
        });
        return res.status(200).json("Status Incompleto.");
      } else {
        return res.status(200).json("Status Incompleto.");
      }
    } else {
      return res.status(203).json("User Identity nÃ£o existe");
    }
  } catch (e) {}
}

export async function getIdentityComplete(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User nÃ£o existe");
    }

    const userIdentity = await UserIdentity.findOne({
      userId: user._id,
    }).lean();


    if (!userIdentity) {
      return res.status(203).json("User nÃ£o existe");
    }

    return res.status(200).json(userIdentity.status);
  } catch (e) {}
}
