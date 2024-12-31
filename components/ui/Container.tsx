import React from 'react';
import { twMerge } from 'tailwind-merge';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

const Container: React.FC<ContainerProps> = ({
  children,
  className,
  fluid,
  style,
  ...rest
}) => {
  const containerClasses = twMerge(
    'w-full px-4',
    'mx-auto',
    !fluid && 'min-[768px]:max-w-[1072px]', // 1024 + px-6 = 24 + 1024 + 24 = 1072
    !fluid && 'min-[1024px]:max-w-[1392px] min-[1024px]:px-14', // 1280 + px-14 = 56 + 1280 + 56 = 1392
    !fluid && 'min-[1440px]:max-w-[1712px]', // 1600 + px-6 = 56 + 1600 + 56 = 1712
    fluid && 'min-[1440px]:px-20 overflow-hidden',
    className,
  );

  return (
    <div className={containerClasses} style={style} {...rest}>
      {children}
    </div>
  );
};
export default Container;
