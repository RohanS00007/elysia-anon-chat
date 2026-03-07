import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

type DialogNoCloseButtonProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  trigger?: React.ReactNode;
  className?: string;
};

export default function DialogNoCloseButton({
  children,
  defaultOpen,
  open,
  onOpenChange,
  showTrigger = true,
  trigger,
  className,
}: DialogNoCloseButtonProps) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger
          render={
            trigger ? (
              <Button>
                <Link href={"/sign-up"}>Login</Link>
              </Button>
            ) : (
              <Button></Button>
            )
          }
        />
      )}
      <DialogContent
        showCloseButton={false}
        className={className ?? "min-w-4xl"}
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
