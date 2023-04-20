export type Course = {
    createdAt: String;
    authorId: String;
    status: "incomplete" | "complete" | "pending_review" | "published";
    name: String;
    thumbnailURL: String;
    productURL: String;
    description: String;
    category: String;
    frequency: "lifetime" | "monthly";
    amount: String;
    currency: String;
  };
  