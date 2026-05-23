import { render } from '@testing-library/react';
import { Sidebar, SidebarContent, SidebarGroup } from './sidebar';

describe('Sidebar', () => {
  it('renders without error', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup />
        </SidebarContent>
      </Sidebar>,
    );
  });
});
