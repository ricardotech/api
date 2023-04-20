import { Request, Response } from "express";
import Bill from "../models/Bill";
import Course from "../models/Course";
import Lesson from "../models/Lesson";
import Module from "../models/Module";
import Subscription from "../models/Subscription";
import User from "../models/User";
import Workspace from "../models/Workspace";
import WorkspaceMember from "../models/WorkspaceMember";
import { Course as CourseType } from "../types/Course.type";

export async function create(req: any, res: any) {
  try {
    const authorId = req.userId;

    const { workspaceId, name, type, description, frequency, amount } =
      req.body;

    const c_exists = await Course.findOne({
      authorId,
      name,
    }).lean();

    if (c_exists) {
      return res.status(203).json("Você já possui um projeto com esse nome.");
    }

    if (!authorId) {
      return res
        .status(203)
        .json({ error: true, message: "authorId is missing" });
    }

    if (!name) {
      return res.status(203).json({ error: true, message: "name is missing" });
    }

    if (!type) {
      return res.status(203).json({ error: true, message: "type is missing" });
    }

    const workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) {
      return res.status(203).json("workspace inválido");
    }

    const userIsWorkspaceAdmin = await WorkspaceMember.findOne({
      workspaceId,
      userId: authorId,
      role: "Admin",
    });

    if (!userIsWorkspaceAdmin) {
      return res.status(203).json("user não tem permissão para criar");
    }

    const course = new Course({
      authorId,
      workspaceId,
      name,
      type,
      description,
      frequency,
      amount,
    });

    await course.save();

    return res.json(course);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readAll(req: Request, res: Response) {
  try {
    const courses: any = await Course.find();

    await Promise.all(
      courses.map(async (course: CourseType, i: number) => {
        const id = course.authorId;
        const author = await User.findOne({ id }).lean();

        let c: any = { ...course };
        c._doc.author = {
          name: author?.name,
          avatar: author?.thumbnail,
        };

        courses[i] = c._doc;
      })
    );

    return res.json(courses);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function read(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const course: any = await Course.findById(id).lean();

    res.json(course);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readByWorkspace(req: any, res: Response) {
  try {
    const { workspaceId } = req.params;

    const userId = req.userId;

    const workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) {
      return res.status(203).json("workspace inválido");
    }

    const userIsWorkspaceMember = await WorkspaceMember.findOne({
      workspaceId,
      userId,
    });

    if (!userIsWorkspaceMember) {
      return res.status(203).json("permissão inválida");
    }

    const projects = await Course.find({
      workspaceId,
    }).lean();

    res.json(projects);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readByInstructor(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const courses: any = await Course.find({ authorId: userId }).lean();

    res.json(courses);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readCourseByInstructorId(req: any, res: Response) {
  try {
    const { courseId } = req.params;

    console.log(courseId);

    const userId = req.userId;

    const courses: any = await Course.findOne({
      _id: courseId,
      authorId: userId,
    }).lean();

    res.json(courses);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readMembers(req: any, res: Response) {
  try {
    const { courseId } = req.params;

    const userId = req.userId;

    if (!courseId) {
      return res.status(203).json("coursId is missing.");
    }

    if (!userId) {
      return res.status(203).json("userId is missing.");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("user doesn't exists.");
    }

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(203).json("course doesn't exists.");
    }

    if (course.authorId !== userId) {
      return res.status(203).json("LMAO");
    }

    const subscriptions = await Subscription.find({
      courseId,
    }).lean();

    return res.json(subscriptions);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readMembersCount(req: any, res: Response) {
  try {
    const { courseId } = req.params;

    const userId = req.userId;

    if (!courseId) {
      return res.status(203).json("coursId is missing.");
    }

    if (!userId) {
      return res.status(203).json("userId is missing.");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("user doesn't exists.");
    }

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(203).json("course doesn't exists.");
    }

    if (course.authorId !== userId) {
      return res.status(203).json("LMAO");
    }

    const subscriptions = await Subscription.find({
      courseId,
    }).lean();

    return res.json(subscriptions.length);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readInvoicing(req: any, res: Response) {
  try {
    const { courseId } = req.params;

    const userId = req.userId;

    if (!courseId) {
      return res.status(203).json("coursId is missing.");
    }

    if (!userId) {
      return res.status(203).json("userId is missing.");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("user doesn't exists.");
    }

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(203).json("course doesn't exists.");
    }

    if (course.authorId !== userId) {
      return res.status(203).json("LMAO");
    }

    const e_bill = await Bill.findOne({
      courseId,
    }).lean();

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const startOfDayISO = startOfDay.toISOString();
    const endOfDayISO = endOfDay.toISOString();

    if (e_bill) {
      const available_bills = await Bill.aggregate([
        {
          $match: {
            courseId: courseId,
            availableAt: {
              $lte: startOfDayISO,
            },
          },
        },
        {
          $group: {
            _id: "$courseId",
            totalBillsAmount: { $sum: "$amount" },
          },
        },
      ]);

      const future_bills = await Bill.aggregate([
        {
          $match: {
            courseId: courseId,
            availableAt: {
              $gt: endOfDayISO,
            },
          },
        },
        {
          $group: {
            _id: "$courseId",
            totalBillsAmount: { $sum: "$amount" },
          },
        },
      ]);

      // return total amount of bills
      // return available bills
      // return future available bills
      return res.json({
        available:
          available_bills.length > 0
            ? available_bills[0].totalBillsAmount * 0.9521
            : 0,
        future: future_bills[0].totalBillsAmount * 0.9521,
      });
    } else {
      return res.json(0);
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readByMember(req: any, res: Response) {
  try {
    const userId = req.userId;

    const { memberId } = req.params;

    if (userId !== memberId) {
      return res.status(203).json("Algo de errado.");
    }

    const coursesIds = await Subscription.find({ userId });

    let courses: CourseType[] = [];

    await Promise.all(
      coursesIds.map(async (subscription, i) => {
        const course: CourseType = await Course.findById(
          subscription.courseId
        ).lean();
        courses.push(course);
      })
    );

    res.json(courses);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function update(req: any, res: Response) {
  try {
    const { id } = req.params;

    const reqUserId = req.userId;

    const course = await Course.findById(id).lean();

    if (course?.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO Ã© seu!");
    } else {
      const payload = req.body;

      await Course.findByIdAndUpdate(
        id,
        payload,
        { useFindAndModify: true, new: true },
        function (err: any, docs: any) {
          if (err) {
            return res.json({ error: true, message: "falhou no mongoose" });
          } else {
            return res.json({
              Message: "Atualizado com sucesso",
              course: docs,
            });
          }
        }
      )
        .clone()
        .catch((error: any) => {
          return res.json({ error: true, message: "falhou no mongoose" });
        });
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function updateThumbnail(req: any, res: Response) {
  try {
    const { id } = req.params;

    const reqUserId = req.userId;

    const course = await Course.findById(id).lean();

    if (course?.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO Ã© seu!");
    } else {
      const { thumbnailURL } = req.body;

      await Course.findByIdAndUpdate(
        id,
        {
          thumbnailURL,
        },
        { useFindAndModify: true, new: true },
        function (err: any, docs: any) {
          if (err) {
            return res.json({ error: true, message: "falhou no mongoose" });
          } else {
            return res.json("Thumbnail atualizada com sucesso");
          }
        }
      )
        .clone()
        .catch((error: any) => {
          return res.json({ error: true, message: "falhou no mongoose" });
        });
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function removeThumbnail(req: any, res: Response) {
  try {
    const { id } = req.params;

    const reqUserId = req.userId;

    const course = await Course.findById(id).lean();

    if (course?.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO Ã© seu!");
    } else {
      const { thumbnailURL } = req.body;

      await Course.findByIdAndUpdate(
        id,
        { $unset: { thumbnailURL: "" } },
        { useFindAndModify: true, new: true },
        function (err: any, docs: any) {
          if (err) {
            return res.json({ error: true, message: "falhou no mongoose" });
          } else {
            console.log(docs);
            return res.json("Thumbnail removida com sucesso");
          }
        }
      )
        .clone()
        .catch((error: any) => {
          return res.json({ error: true, message: "falhou no mongoose" });
        });
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function updateIndex(req: any, res: Response) {
  try {
    const { courseId } = req.params;

    const reqUserId = req.userId;

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(203).json("Esse curso não existe");
    }

    if (course.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO seu!");
    } else {
      const { modules } = req.body;

      if (!modules) {
        return res.status(203).json("missing modules.");
      }

      let m: any[] = modules;

      const bulkOps: any[] = [];
      m.map((module, i) => {
        const update = { $set: { index: module.index } };
        bulkOps.push({
          updateOne: {
            filter: { _id: module._id },
            update: update,
          },
        });
      });

      await Module.bulkWrite(bulkOps, { ordered: false });
      return res.json("Atualizado com sucesso!");
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function updateGuarantee(req: any, res: Response) {
  try {
    const { id } = req.params;

    const reqUserId = req.userId;

    const course = await Course.findById(id).lean();

    if (course?.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO Ã© seu!");
    } else {
      const { guarantee } = req.body;

      if (guarantee !== "7d" && guarantee !== "14d" && guarantee !== "30d") {
        return res.status(203).json("Garantia invÃ¡lida.");
      }

      await Course.findByIdAndUpdate(
        id,
        {
          guarantee,
        },
        { useFindAndModify: true, new: true },
        function (err: any, docs: any) {
          if (err) {
            return res.json({ error: true, message: "falhou no mongoose" });
          } else {
            return res.json("Guarantee atualizada com sucesso");
          }
        }
      )
        .clone()
        .catch((error: any) => {
          return res.json({ error: true, message: "falhou no mongoose" });
        });
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function updateEmailSupport(req: any, res: Response) {
  try {
    const { id } = req.params;

    const reqUserId = req.userId;

    const course = await Course.findById(id).lean();

    if (course?.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO Ã© seu!");
    } else {
      const { emailSupport } = req.body;

      if (!emailSupport) {
        return res.status(203).json("Email invÃ¡lido.");
      }

      await Course.findByIdAndUpdate(
        id,
        {
          emailSupport,
        },
        { useFindAndModify: true, new: true },
        function (err: any, docs: any) {
          if (err) {
            return res.json({ error: true, message: "falhou no mongoose" });
          } else {
            return res.json("Email de suporte atualizado com sucesso");
          }
        }
      )
        .clone()
        .catch((error: any) => {
          return res.json({ error: true, message: "falhou no mongoose" });
        });
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function updateCategory(req: any, res: Response) {
  try {
    const { id } = req.params;

    const reqUserId = req.userId;

    const course = await Course.findById(id).lean();

    if (course?.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO Ã© seu!");
    } else {
      const { category } = req.body;

      const options = [
        "ProgramaÃ§Ã£o",
        "Gastronomia",
        "Fitness",
        "Mercado Financeiro",
        "Marketing",
        "LanÃ§amento",
        "Autoconhecimento",
        "Espiritualidade",
        "Design GrÃ¡fico",
        "ProduÃ§Ã£o CinematogrÃ¡fica",
        "Arquitetura & Urbanismo",
        "Engenharia",
        "Advocacia",
        "Medicina",
        "Fisioterapia",
        "ComÃ©rcio",
        "Futebol",
        "InglÃªs",
        "MatemÃ¡tica",
        "Quimica",
        "Biologia",
        "FÃ­sica",
        "Geometria",
        "Geografia",
        "Outro",
      ];

      if (!options.includes(req.body.category)) {
        return res.status(203).json("Categoria invÃ¡lida.");
      }
      await Course.findByIdAndUpdate(
        id,
        {
          category,
        },
        { useFindAndModify: true, new: true },
        function (err: any, docs: any) {
          if (err) {
            return res.json({ error: true, message: "falhou no mongoose" });
          } else {
            return res.json("Categoria atualizada com sucesso");
          }
        }
      )
        .clone()
        .catch((error: any) => {
          return res.json({ error: true, message: "falhou no mongoose" });
        });
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function updateData(req: any, res: Response) {
  try {
    const { id } = req.params;

    const reqUserId = req.userId;

    const course = await Course.findById(id).lean();

    if (course?.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO Ã© seu!");
    } else {
      const { name, description } = req.body;

      const expectedProperties = ["name", "description"];
      const reqBodyProperties = Object.keys(req.body);

      const propertiesExist = expectedProperties.every((property) =>
        reqBodyProperties.includes(property)
      );

      if (!propertiesExist) {
        return res.status(203).json("Dados invÃ¡lidos.");
      }

      const n_exists = await Course.findOne({
        authorId: reqUserId,
        name,
      });

      if (n_exists) {
        return res.status(203).json("Você já possui um projeto com esse nome.");
      }

      const payload = {
        name: name,
        description: description,
      };

      await Course.findByIdAndUpdate(
        id,
        payload,
        { useFindAndModify: true, new: true },
        function (err: any, docs: any) {
          if (err) {
            return res.json({ error: true, message: "falhou no mongoose" });
          } else {
            return res.json("Dados atualizados com sucesso");
          }
        }
      )
        .clone()
        .catch((error: any) => {
          return res.json({ error: true, message: "falhou no mongoose" });
        });
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function remove(req: any, res: Response) {
  try {
    const { id } = req.params;

    const userId = req.userId;

    const user = await User.findById(userId).lean();

    if (!userId) {
      return res.json("userId não encontrado.");
    }

    if (!user) {
      return res.json("user não existe.");
    }

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.json("curso não existe.");
    }

    if (course.authorId !== userId) {
      return res.json("Esse curso não é seu");
    }

    const subscriptions = await Subscription.findOne({
      courseId: id,
    }).lean();

    if (subscriptions) {
      return res.json("Não é possível deletar um curso com alunos ativos.");
    }

    const modules = await Module.find({
      courseId: id,
    }).lean();

    await Promise.all(
      modules.map(async (module, i) => {
        await Lesson.find({
          moduleId: module._id,
        })
          .then((lessons) => {
            lessons.map(async (lesson, i) => {
              await Lesson.findByIdAndDelete(lesson._id);
            });
          })
          .then(() => {
            Module.findByIdAndDelete(module._id);
          });
      })
    );

    await Course.findByIdAndDelete(id);

    res.json("Curso deletado com sucesso!");
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}
