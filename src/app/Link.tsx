import NextLink from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("", {
  variants: {
    variant: {
      default: "text-blue-600 hover:text-blue-800 underline",
      footer: "text-sm text-gray-500 hover:text-gray-900 transition-colors",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type NextLinkArgs = Parameters<typeof NextLink>;

const LinkFoo = React.forwardRef<
  HTMLAnchorElement,
  NextLinkArgs[0] & VariantProps<typeof buttonVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <NextLink
      prefetch={false}
      ref={ref}
      {...props}
      className={cn(buttonVariants({ variant, className }))}
    />
  );
});

const Link: (...args: NextLinkArgs) => React.JSX.Element = (props) => {
  // TODO
  //   const defaultProps: Partial<typeof props> = {
  //     prefetch: false,
  //   };
  //   const mergedProps = { ...defaultProps, ...props };
  return (
    <NextLink
      prefetch={false}
      className="text-blue-600 hover:text-blue-800 underline"
      {...props}
    ></NextLink>
  );
};

export default LinkFoo;
