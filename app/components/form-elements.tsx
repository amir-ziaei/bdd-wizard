import * as React from "react";

export const FitToContentTextArea = React.forwardRef(
  function FitToContentTextArea(
    { onChange, ...restOfProps }: React.ComponentProps<"textarea">,
    forwardedRef: React.ForwardedRef<HTMLTextAreaElement>
  ) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const handleRef = useForkRef(forwardedRef, textareaRef);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      if (onChange) onChange(e);
    };

    return (
      <textarea ref={handleRef} {...restOfProps} onChange={handleChange} />
    );
  }
);

// Copied from https://github.com/mui/material-ui/blob/6e8b99d133025c9e785a778a183fa81383998a42/packages/mui-utils/src/useForkRef.ts
function useForkRef<Instance>(
  ...refs: Array<React.Ref<Instance> | undefined>
): React.RefCallback<Instance> | null {
  /**
   * This will create a new function if the refs passed to this hook change and are all defined.
   * This means react will call the old forkRef with `null` and the new forkRef
   * with the ref. Cleanup naturally emerges from this behavior.
   */
  return React.useMemo(() => {
    if (refs.every((ref) => ref == null)) {
      return null;
    }

    return (instance) => {
      refs.forEach((ref) => {
        setRef(ref, instance);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

/**
 * passes {value} to {ref}
 *
 * WARNING: Be sure to only call this inside a callback that is passed as a ref.
 * Otherwise, make sure to cleanup the previous {ref} if it changes. See
 * https://github.com/mui/material-ui/issues/13539
 *
 * Useful if you want to expose the ref of an inner component to the public API
 * while still using it inside the component.
 * @param ref A ref callback or ref object. If anything falsy, this is a no-op.
 */
// copied from https://github.com/mui/material-ui/blob/6e8b99d133025c9e785a778a183fa81383998a42/packages/mui-utils/src/setRef.ts
function setRef<T>(
  ref:
    | React.MutableRefObject<T | null>
    | ((instance: T | null) => void)
    | null
    | undefined,
  value: T | null
): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
