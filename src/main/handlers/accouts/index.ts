import { randomUUID } from 'crypto';
import { ipcMain } from 'electron';
import { AccountsIPC } from '../../../shared/types/ipc';
import { getDb, schema } from '../../db';
import type { IAccounts, IAccount, ICreateAccountBody } from '../../../shared/types/contract';


const serializeAccount = (row: IAccount): IAccount => {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};


const getCurrentAccount = async () => {
  const rows = await getDb().select().from(schema.accounts);

  const result = rows?.reduce((acc: IAccounts, row) => {
    const account = serializeAccount(row);
    if (acc.currentAccount == null && row.isCurrent) {
      acc.currentAccount = account;
    } else {
      acc.accounts.push(account);
    }

    return acc;

  }, { currentAccount: undefined, accounts: [] });

  return result;
};


const createAccount = async (_event: Electron.IpcMainInvokeEvent, { accountName }: ICreateAccountBody) => {

  console.log('createAccount', accountName);


  const now = new Date();
  const account = {
    id: randomUUID(),
    name: accountName,
    createdAt: now,
    updatedAt: now,
  };
  getDb().insert(schema.accounts).values(account).run();
  return serializeAccount(account);
};

export const registerAccountsHandlers = () => {
  ipcMain.handle(AccountsIPC.GET_ACCOUNTS, getCurrentAccount);
  ipcMain.handle(AccountsIPC.CREATE_ACCOUNT, createAccount);
};