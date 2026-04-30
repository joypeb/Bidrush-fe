export type RsvpFieldErrors = {
  contact?: string;
  channel?: string;
  consent?: string;
};

export type RsvpProblem =
  | { kind: "duplicate"; message: string; maskedContact?: string }
  | { kind: "validation"; message: string; fieldErrors?: RsvpFieldErrors }
  | { kind: "retry"; message: string }
  | { kind: "server"; message: string };

type ProblemBody = {
  detail?: string;
  maskedContact?: string;
};

export async function mapRsvpProblem(response: Response): Promise<RsvpProblem> {
  const problem = await readProblem(response);

  if (response.status === 409) {
    return {
      kind: "duplicate",
      message: "You're already on the reminder list for this drop.",
      maskedContact: problem.maskedContact,
    };
  }

  if (response.status === 400) {
    return {
      kind: "validation",
      message: "Fix the highlighted fields.",
      fieldErrors: {
        contact: "Check this contact and reminder channel.",
        channel: "Choose the channel that matches the contact.",
      },
    };
  }

  if (response.status === 429) {
    return {
      kind: "retry",
      message: "Too many attempts. Keep your details here and try again shortly.",
    };
  }

  return {
    kind: "server",
    message: "We could not save the reminder yet. Please try again.",
  };
}

async function readProblem(response: Response): Promise<ProblemBody> {
  try {
    return (await response.json()) as ProblemBody;
  } catch {
    return {};
  }
}
