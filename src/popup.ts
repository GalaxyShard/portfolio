/**
 *
 * @source: https://portfolio.byteroach.com/src/popup.ts
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page
 *
 * Copyright (C) 2022-2024 Dominic Adragna
 *
 * The JavaScript code in this page is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page
 *
 */

const popup = document.createElement("div");
popup.id = "popup";
popup.classList.add("closed");
popup.setAttribute("role", "dialog");
popup.setAttribute("aria-modal", "true");
popup.setAttribute("aria-hidden", "true");


const closeButton = document.createElement("button");
closeButton.setAttribute("aria-label", "Close");

popup.appendChild(closeButton);
document.body.appendChild(popup);

let popupFrame: HTMLIFrameElement | null = null;

let closedEvent: (() => void) | undefined = undefined;
closeButton.addEventListener("click", _ => {
    popup.classList.remove("opened");
    setTimeout(() => {
        popup.classList.add("closed");
        popup.setAttribute("aria-hidden","true");
        popupFrame?.remove();
        popupFrame = null;
    }, 500);

    closedEvent?.();
    closedEvent = undefined;
});

export function openPopup(subpage: string, onClose?: (() => void)): boolean {
    if (!popup.classList.contains("closed")) {
        return false;
    }
    popupFrame = document.createElement("iframe");
    popupFrame.src = subpage;

    popup.appendChild(popupFrame);
    closedEvent = onClose;

    popup.classList.remove("closed");
    popup.classList.add("opened");
    popup.setAttribute("aria-hidden","false");

    closeButton.focus();
    return true;
}