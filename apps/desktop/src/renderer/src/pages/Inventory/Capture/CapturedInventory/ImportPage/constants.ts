export const LOADING_LABEL = {
  ReadingFile: 'Reading file…',
  CheckingDatabase: 'Checking against database…',
  SavingToDatabase: 'Saving to database…',
} as const;

export const FILE_READ_ERROR =
  'Could not read the file. Make sure it is a valid .xlsx or .csv file.';
export const SAVE_ERROR = 'Something went wrong while saving. Please try again.';
