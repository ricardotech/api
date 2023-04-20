import { Request, Response } from "express";
import Course from "../models/Course";
import Lesson from "../models/Lesson";
import Module from "../models/Module";
import Team from "../models/Workspace";
import User from "../models/User";
import Workspace from "../models/Workspace";
import WorkspaceMember from "../models/WorkspaceMember";
import bcrypt from "bcrypt";
import WorkspaceInvite from "../models/WorkspaceInvite";
import { transporter } from "../utils/nodemailer";
import { generateToken } from "../utils/generateToken";

export async function create(req: any, res: Response) {
  try {
    const { name } = req.body;

    const userId = req.userId;

    if (!name) {
      return res.status(203).json("Qual o nome do time?");
    }

    if (!userId) {
      return res.status(203).json("userId is missing");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("Esse user não existe");
    }

    const e_team = await Workspace.findOne({
      authorId: userId,
      name,
    });

    if (e_team) {
      return res.status(203).json("Você já possui um time com esse nome");
    }

    const workspace = new Workspace({
      authorId: userId,
      name,
    });

    await workspace.save();

    const workspaceMember = new WorkspaceMember({
      role: "Admin",
      userId,
      workspaceId: String(workspace._id),
      invitorId: userId,
    });

    await workspaceMember.save();

    return res.json({
      success: true,
      workspace,
    });
  } catch (e) {
    return res.status(500).json(e);
  }
}

export async function invite(req: any, res: Response) {
  try {
    const { email, workspaceId, role } = req.body;

    const invitorId = req.userId;

    const invitor = await User.findById(invitorId).lean();

    if (!invitor) {
      return res.status(203).json("invitor não existe");
    }

    if (role !== "Collaborator" && role !== "Admin") {
      return res.status(203).json("Role inválido");
    }

    const workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) {
      return res.status(203).json("workspace não existe");
    }

    if (invitorId !== workspace.authorId) {
      return res.status(203).json("esse workspace não é seu");
    }

    const member = await User.findOne({
      email,
    }).lean();

    if (!member) {
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const invitation = new WorkspaceInvite({
        email,
        workspaceId: workspaceId,
        token,
        role,
        expiresAt,
        invitorId,
      });

      await invitation.save();

      const inviteLink = `http://localhost:3000/dashboard/workspace/${workspaceId}/invite/${token}`;

      await transporter.sendMail({
        from: "Membros <suporte@membros.me>", // sender address
        to: email,
        subject: `Você recebeu um convite`, // Subject line
        html: `<p>Você foi convidado para participar do Workspace: ${workspace.name}<br />
        <a href="${inviteLink}">Use esse link para aceitar o convite</a>`,
      });

      res.json("Convite enviado");
    } else {
      if (String(member._id) === invitorId) {
        return res.status(203).json("Membro já participa deste Workspace");
      }

      const alreadyMember = await WorkspaceMember.findOne({
        userId: member._id,
        workspaceId,
      }).lean();

      if (alreadyMember) {
        return res.status(203).json("Membro já participa deste Workspace");
      }

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const invitation = new WorkspaceInvite({
        email,
        workspaceId: workspaceId,
        token,
        role,
        expiresAt,
        invitorId,
      });

      await invitation.save();

      const inviteLink = `http://localhost:3000/dashboard/workspace/${workspaceId}/invite/${token}`;

      await transporter.sendMail({
        from: "Membros <suporte@membros.me>", // sender address
        to: email,
        subject: `Você recebeu um convite`, // Subject line
        html: `<p>Você foi convidado para participar do Workspace: ${workspace.name}<br />
        <a href="${inviteLink}">Use esse link para aceitar o convite</a>`,
      });

      res.json("Convite enviado");
    }
  } catch (e) {
    return res.status(500).json(e);
  }
}

export async function getInvite(req: any, res: Response) {
  try {
    const { workspaceId, token } = req.params;

    const userId = req.userId;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("Convite não é válido. 1");
    }

    const workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) {
      return res.status(203).json({ error: "Convite não é válido. 2" });
    }

    if (userId === String(workspace.authorId)) {
      return res.status(203).json("Você já faz parte desse workspace");
    }

    const workspaceInvite = await WorkspaceInvite.findOne({
      workspaceId,
      token,
    }).lean();

    if (!workspaceInvite) {
      return res.status(203).json("Convite não é válido. 3");
    } else {
      const workspacemember = await WorkspaceMember.findOne({
        workspaceId,
        userId,
      }).lean();

      if (workspacemember) {
        return res.status(203).json("Você já faz parte desse workspace");
      }

      const member = await User.findOne({
        email: workspaceInvite.email,
      }).lean();

      if (!member) {
        return res.status(203).json("Convite não é válido. 4");
      }

      if (userId !== String(member._id)) {
        return res.status(203).json("Convite não é válido. 5");
      }

      const workspaceMember = new WorkspaceMember({
        role: workspaceInvite.role,
        userId,
        invitorId: workspaceInvite.invitorId,
        workspaceId,
      });

      await workspaceMember.save().then(() => {
        WorkspaceInvite.findOneAndDelete({
          workspaceId,
          token,
        }).then(() => {
          return res.json("Convite executado com sucesso!");
        });
      });
    }
  } catch (e) {
    return res.status(500).json(e);
  }
}

export async function readByUserId(req: any, res: Response) {
  try {
    const userId = req.userId;

    const workspaces: any[] = [];

    const workspacesMember = await WorkspaceMember.find({
      userId,
    }).lean();

    await Promise.all(
      workspacesMember.map(async (wm, i) => {
        let w: any = {};
        const workspace = await Workspace.findById(wm.workspaceId).lean();
        w = workspace;
        w.role = wm.role;
        workspaces.push(w);
      })
    );

    return res.json(workspaces);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readMembers(req: any, res: Response) {
  try {
    const userId = req.userId;

    const { workspaceId } = req.params;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("User inválido");
    }

    const workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) {
      return res.status(203).json("Workspace inválido");
    }

    const members: any[] = [];

    const workspaceMembers = await WorkspaceMember.find({
      workspaceId,
    }).lean();

    if (!workspaceMembers) {
      return res.status(203).json("Workspace sem membros");
    }

    await Promise.all(
      workspaceMembers.map(async (wm, i) => {
        let m: any = {};
        const member = await User.findById(String(wm.userId)).lean();
        if (!member) {
          return res.status(203).json("Membro inválido");
        } else {
          m = member;
          m.workspaceRole = wm.role;
          members.push(m);
        }
      })
    );

    return res.json(members);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function read(req: any, res: Response) {
  try {
    const { id } = req.params;

    const userId = req.userId;

    if (!userId) {
      return res.status(203).json("userId is missing");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("Esse usuário não existe");
    }

    const workspace = await Workspace.findById(id).lean();

    return res.json(workspace);
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

export async function remove(req: any, res: Response) {
  try {
    const { id } = req.params;

    const userId = req.userId;

    const workspace = await Workspace.findById(id).lean();

    if (!workspace) {
      return res.status(203).json("Esse time não existe.");
    }

    await Workspace.findByIdAndDelete(id);

    res.json("Time deletado com sucesso!");
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}
