export interface Auth {
  user: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
  shareToken: string;
}
