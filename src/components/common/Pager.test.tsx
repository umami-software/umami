import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { Pager } from './Pager';

describe('Pager', () => {
  it('renders nothing when count is 0', () => {
    render(<Pager page={1} pageSize={20} count={0} onPageChange={vi.fn()} />);

    expect(screen.queryByText(/record/)).not.toBeInTheDocument();
  });

  it('renders record count and hides navigation when count fits on one page', () => {
    render(<Pager page={1} pageSize={20} count={10} onPageChange={vi.fn()} />);

    expect(screen.getByText('10 records')).toBeInTheDocument();
    expect(screen.queryByText(/Page 1 of/)).not.toBeInTheDocument();
  });

  it('renders page navigation and buttons when count spans multiple pages', () => {
    const onPageChange = vi.fn();

    render(<Pager page={2} pageSize={20} count={50} onPageChange={onPageChange} />);

    expect(screen.getByText('50 records')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(buttons[1]);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on the first page', () => {
    render(<Pager page={1} pageSize={20} count={50} onPageChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
  });

  it('disables next button on the last page', () => {
    render(<Pager page={3} pageSize={20} count={50} onPageChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('renders page size selector when onPageSizeChange is provided', () => {
    const onPageSizeChange = vi.fn();

    render(
      <Pager
        page={1}
        pageSize={20}
        count={100}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    expect(screen.getByText('Rows per page')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('calls onPageSizeChange when another page size is selected', async () => {
    const onPageSizeChange = vi.fn();

    const { user } = render(
      <Pager
        page={1}
        pageSize={20}
        count={100}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    const trigger = screen.getByRole('combobox', { name: /rows per page/i });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    const option = await screen.findByRole('option', { name: '50' });
    await user.click(option);

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('does not render page size selector when onPageSizeChange is omitted', () => {
    render(<Pager page={1} pageSize={20} count={100} onPageChange={vi.fn()} />);

    expect(screen.queryByText('Rows per page')).not.toBeInTheDocument();
  });

  it('supports custom pageSizeOptions and preserves custom current pageSize', () => {
    render(
      <Pager
        page={1}
        pageSize={15}
        count={100}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        pageSizeOptions={[10, 20, 50]}
      />,
    );

    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
