export interface API_Item {
  id: string;
  name: string;
  description?: string | null;
  collectionId?: string | null;
  boxId: string;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type Item = API_Item;
