import { AnimatePresence, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type TextEffectProps = {
  children: string;
  className?: string;
  as?: keyof typeof motion;
  delay?: number;
  trigger?: boolean;
  animateOnMount?: boolean;
};

const itemVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 10 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 0.85,
    },
  },
};

export function TextEffect({
  children,
  className,
  as = "p",
  delay = 0,
  trigger = true,
  animateOnMount = false,
}: TextEffectProps) {
  const MotionTag = motion[as] as typeof motion.p;

  return (
    <AnimatePresence mode="wait">
      {trigger ? (
        <MotionTag
          initial="hidden"
          animate={animateOnMount ? "visible" : undefined}
          whileInView={animateOnMount ? undefined : "visible"}
          viewport={animateOnMount ? undefined : { once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.035,
                delayChildren: delay,
              },
            },
          }}
          className={cn(className)}
        >
          {children.split(" ").map((segment, index) => (
            <motion.span
              key={`${segment}-${index}`}
              variants={itemVariants}
              className="inline-block whitespace-pre"
            >
              {segment}
              {index < children.split(" ").length - 1 ? " " : ""}
            </motion.span>
          ))}
        </MotionTag>
      ) : null}
    </AnimatePresence>
  );
}
