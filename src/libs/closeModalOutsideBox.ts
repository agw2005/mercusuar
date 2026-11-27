import type { RefObject } from "preact";

export const closeModalOutsideBox = (
    e: MouseEvent,
    modal: RefObject<HTMLDialogElement>,
) => {
    if (!modal.current) return;
    const modalDimensions = modal
        .current
        .getBoundingClientRect();
    if (
        e.clientX < modalDimensions.left ||
        e.clientX > modalDimensions.right ||
        e.clientY < modalDimensions.top ||
        e.clientY > modalDimensions.bottom
    ) {
        modal.current.close();
    }
};
