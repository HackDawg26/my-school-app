
'use client';

import {cn} from '../lib/utils';
import {useMobile} from '../../hooks/use-mobile';
import {cva, type VariantProps} from 'class-variance-authority';
import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from './drawer';
import {Button} from './button';
import {Menu, X} from 'lucide-react';

const sidebarVariants = cva(
  'z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground shadow-lg',
  {
    variants: {
      orientation: {
        left: 'inset-y-0 left-0 border-r border-sidebar-border',
        right: 'inset-y-0 right-0 border-l border-sidebar-border',
      },
    },
    defaultVariants: {
      orientation: 'left',
    },
  }
);

interface SidebarContextProps extends VariantProps<typeof sidebarVariants> {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({
  children,
  ...props
}: {children: React.ReactNode} & VariantProps<typeof sidebarVariants>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        orientation: props.orientation,
      }}
    >
        {children}
    </SidebarContext.Provider>
  );
}

export const SidebarContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('flex flex-col h-full', className)} {...props} />;
});
SidebarContent.displayName = 'SidebarContent';


export const Sidebar = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }
>(({className, children, ...props}, ref) => {
  const { isOpen, setIsOpen, orientation} = useSidebar();
  const isMobile = useMobile();
  
  if(isMobile) {
    return (
        <Drawer
          open={isOpen}
          onOpenChange={setIsOpen}
          direction="left"
          onClose={() => setIsOpen(false)}
        >
          <DrawerPortal>
            <DrawerOverlay />
            <DrawerContent
              className={cn(
                sidebarVariants({orientation}),
                'w-64',
                'm-0 rounded-none'
              )}
            >
              {children}
            </DrawerContent>
          </DrawerPortal>
        </Drawer>
    )
  }

  return (
    <aside
      ref={ref}
      className={cn(
        'fixed w-64 hidden sm:flex',
        sidebarVariants({orientation}),
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
});
Sidebar.displayName = 'Sidebar';

export const SidebarHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-16 shrink-0 items-center gap-4 border-b border-sidebar-border px-4',
        className
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarHeading = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'text-lg font-semibold text-sidebar-foreground',
        className
      )}
      {...props}
    />
  );
});
SidebarHeading.displayName = 'SidebarHeading';

export const SidebarBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => {
  return <div ref={ref} className={cn('flex flex-col flex-1 p-4', className)} {...props} />;
});
SidebarBody.displayName = 'SidebarBody';

export const SidebarInset = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  return (
    <div
      ref={ref}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';

export function SidebarTrigger({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const {isOpen, setIsOpen} = useSidebar();

  function toggleSidebar() {
    setIsOpen(!isOpen);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'text-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={toggleSidebar}
      {...props}
    >
      {isOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );
}

export const SidebarFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mt-auto border-t border-sidebar-border p-4', className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = 'SidebarFooter';
