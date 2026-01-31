export interface IAccount {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccounts {
  accounts: IAccount[];
  currentAccount: IAccount | undefined;
}

export interface ICreateAccountBody {
  accountName: string;
}