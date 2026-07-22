import { memo } from 'react';
import type { ReactNode } from 'react';

interface ComparePageShellProps {
  children: ReactNode;
}

function ComparePageShell({ children }: ComparePageShellProps) {
  return <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>;
}

export default memo(ComparePageShell);
