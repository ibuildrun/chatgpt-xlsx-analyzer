export interface Thread {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateThreadInput {
  title: string;
}

export interface UpdateThreadInput {
  title?: string;
}
