import { render, screen } from '@testing-library/react';
import ArticleTags from './ArticleTags';

describe('ArticleTags strategy-lab component boundary', () => {
  it('renders every user-visible tag', () => {
    render(<ArticleTags tagList={['testing', 'quality']} />);
    expect(screen.getByText('testing')).toBeInTheDocument();
    expect(screen.getByText('quality')).toBeInTheDocument();
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<ArticleTags tagList={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
