import { render } from '@testing-library/react';
import { Dialog, DialogContent, DialogTrigger } from './dialog';

describe('Dialog', () => {
  it('renders without error', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    );
  });
});
