import { Request, Response } from "express";
import Course from "../models/Course";
import Lesson from "../models/Lesson";
import Module from "../models/Module";

export async function create(req: any, res: Response) {
  try {
    const { courseId, name } = req.body;

    const userId = req.userId;

    if (!courseId) {
      return res.status(203).json("courseId is missing");
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(203).json("Esse curso nÃ£o existe");
    }

    if (course.authorId !== userId) {
      return res.status(203).json("Esse curso NÃO Ã© seu");
    }

    const e_module = await Module.findOne({
      courseId,
      name,
    });

    if (e_module) {
      return res
        .status(203)
        .json("Esse curso jÃ¡ possui um mÃ³dulo com esse nome");
    }

    if (!name) {
      return res.status(203).json("Qual o nome do mÃ³dulo?");
    }

    const module = new Module({
      courseId,
      name,
    });

    await module.save();

    return res.json({
      success: true,
      module,
    });
  } catch (e) {
    return res.status(500).json(e);
  }
}

export async function readAll(req: Request, res: Response) {
  try {
    const { courseId } = req.params;

    const modules: any = await Module.find({
      courseId: courseId,
    });

    return res.json(modules);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function read(req: Request, res: Response) {
  try {
    type lesson = {
      _id: string;
      createdAt: string;
      moduleId: string;
      title: string;
      description: string;
    };

    const { id } = req.params;

    const module: any = await Module.findById(id).lean();

    const lr: lesson[] = await Lesson.find({ moduleId: id }).lean();

    let m: any = { ...module };
    m.lessons = lr.sort((a, b) => a.title.localeCompare(b.title));

    res.json(m);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readByCourseId(req: Request, res: Response) {
  try {
    const { courseId } = req.params;

    type module = {
      createdAt: string;
      index: number;
      courseId: string;
      name: string;
      thumbnail: string;
    };

    const modules: module[] = await Module.find({ courseId }).lean();

    modules.sort(function (a, b) {
      return a.index - b.index;
    });

    res.json(modules);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const payload = req.body;

    await Module.findByIdAndUpdate(
      id,
      payload,
      { useFindAndModify: true, new: true },
      function (err: any, docs: any) {
        if (err) {
          return res.json({ error: true, message: "falhou no mongoose" });
        } else {
          return res.json({
            Message: "Atualizado com sucesso",
            module: docs,
          });
        }
      }
    )
      .clone()
      .catch((error: any) => {
        return res.json({ error: true, message: "falhou no mongoose" });
      });
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function updateData(req: any, res: Response) {
  try {
    const { id } = req.params;

    const reqUserId = req.userId;

    const module = await Module.findById(id).lean();

    if (!module) {
      return res.status(203).json("Esse mÃ³dulo nÃ£o existe!");
    }

    const course = await Course.findById(module.courseId);

    if (!course) {
      return res.status(203).json("Esse curso nÃ£o existe!");
    }

    if (course.authorId !== reqUserId) {
      return res.status(401).json("Esse curso NÃO Ã© seu!");
    } else {
      const { name } = req.body;

      const expectedProperties = ["name"];
      const reqBodyProperties = Object.keys(req.body);

      const propertiesExist = expectedProperties.every((property) =>
        reqBodyProperties.includes(property)
      );

      if (!propertiesExist) {
        return res.status(203).json("Dados invÃ¡lidos.");
      }

      const n_exists = await Module.findOne({
        courseId: course._id,
        name,
      });

      if (n_exists) {
        return res.status(203).json("VocÃª jÃ¡ possui um mÃ³dulo com esse nome");
      }

      const payload = {
        name: name,
      };

      await Module.findByIdAndUpdate(
        module._id,
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

    const module = await Module.findById(id).lean();

    if (!module) {
      return res.status(203).json("Esse mÃ³dulo nÃ£o existe.");
    }

    const course = await Course.findById(module.courseId).lean();

    if (!course) {
      return res.status(203).json("Esse curso nÃ£o existe.");
    }

    if (userId !== course.authorId) {
      return res.status(203).json("Esse curso NÃO Ã© seu.");
    }

    const lessons = await Lesson.find({
      moduleId: module._id,
    });

    if (lessons) {
      await Promise.all(
        lessons.map((lesson, i) => {
          Lesson.findByIdAndDelete(lesson._id);
        })
      );
    }

    await Module.findByIdAndDelete(id);

    res.json("MÃ³dulo deletado com sucesso!");
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}
