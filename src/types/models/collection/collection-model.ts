export interface API_Collection {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    boxes: number;
  };
}

export type Collection = Pick<API_Collection, 'id' | 'name' | 'userId'> & {
  boxCount?: number;
}
