import { Request, Response } from "express";
import Course from "../models/Course";
import Lesson from "../models/Lesson";
import LessonDone from "../models/LessonDone";
import Module from "../models/Module";

export async function create(req: any, res: Response) {
  try {
    const { moduleId, title, contentUrl } = req.body;

    const userId = req.userId;

    if (!moduleId) {
      return res.status(203).json("moduleId is missing");
    }

    const module = await Module.findById(moduleId).lean();

    if (!module) {
      return res.status(203).json("Esse mÃ³dulo nÃ£o existe.");
    }

    const course = await Course.findById(module?.courseId).lean();

    if (!course) {
      return res.status(203).json("Esse curso nÃ£o existe.");
    }

    if (course.authorId !== userId) {
      return res.status(203).json("Esse curso NÃO Ã© seu");
    }

    const e_lesson = await Lesson.findOne({
      moduleId,
      title,
    });

    if (e_lesson) {
      return res
        .status(203)
        .json("Esse mÃ³dulo jÃ¡ possui uma aula com esse nome");
    }

    if (!title) {
      return res.status(203).json("title is missing");
    }

    if (!contentUrl) {
      return res.status(203).json("contentUrl is missing");
    }

    const lesson = new Lesson({
      moduleId,
      title,
      contentUrl,
    });

    await lesson.save();

    return res.json({
      success: true,
      lesson,
    });
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function createLessonDone(req: any, res: Response) {
  try {
    const { moduleId, lessonId, done } = req.body;

    const userId = req.userId;

    if (!moduleId) {
      return res
        .status(401)
        .json({ error: true, message: "moduleId is missing" });
    }

    if (!lessonId) {
      return res
        .status(401)
        .json({ error: true, message: "lessonId is missing" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ error: true, message: "userId is missing" });
    }

    if (!done) {
      return res.status(401).json({ error: true, message: "done is missing" });
    }

    const lessonDone = new LessonDone({
      moduleId,
      lessonId,
      userId,
      done,
    });

    await lessonDone.save();

    return res.json({
      success: true,
      lessonDone,
    });
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readAll(req: Request, res: Response) {
  try {
    const { moduleId } = req.params;

    const modules: any = await Lesson.find({
      moduleId: moduleId,
    });

    return res.json(modules);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function read(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const lesson: any = await Lesson.findById(id).lean();

    res.json(lesson);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readByModuleId(req: Request, res: Response) {
  try {
    const { moduleId } = req.params;

    type lesson = {
      createdAt: string;
      index: number;
      moduleId: string;
      title: string;
      contentUrl: string;
    };

    const lessons: lesson[] = await Lesson.find({ moduleId }).lean();

    lessons.sort(function (a, b) {
      return a.index - b.index;
    });

    res.json(lessons);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readLessonsDoneByModuleId(req: any, res: Response) {
  try {
    const { moduleId } = req.params;

    const userId = req.userId;

    type lesson = {
      moduleId: string;
      lessonId: string;
    };

    const lessons = await LessonDone.find({ moduleId, userId }).lean();

    res.json(lessons);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const payload = req.body;

    await Lesson.findByIdAndUpdate(
      id,
      payload,
      { useFindAndModify: true, new: true },
      function (err: any, docs: any) {
        if (err) {
          return res.json({ error: true, message: "falhou no mongoose" });
        } else {
          return res.json({
            Message: "Atualizado com sucesso",
            lesson: docs,
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

export async function remove(req: any, res: Response) {
  try {
    const { id } = req.params;

    const userId = req.userId;

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(203).json("Esse curso nÃ£o existe!");
    }

    if (course.authorId !== userId) {
      return res.status(203).json("Esse curso NÃO Ã© seu!");
    }

    const lesson = await Lesson.findByIdAndDelete(id);

    res.json(lesson);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function removeAllDonesByModuleId(req: any, res: Response) {
  try {
    const { moduleId } = req.params;

    const userId = req.userId;

    const lesson = await LessonDone.deleteMany({ moduleId, userId });

    res.json(lesson);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function removeDoneByLessonId(req: any, res: Response) {
  try {
    const { lessonId } = req.params;

    const userId = req.userId;

    const lesson = await LessonDone.findOneAndDelete({ lessonId, userId });

    res.json(lesson);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}
