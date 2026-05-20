import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { SciHubFetcher } from "./SciHubFetcher";

export class Common {
  private static menuItemId = "scipdf-fetch-menuitem";
  private static popupShowingListener?: (event: Event) => void;

  static registerPrefs() {
    const prefOptions = {
      pluginID: config.addonID,
      src: rootURI + "content/preferences.xhtml",
      label: getString("prefs-title"),
      image: `chrome://${config.addonRef}/content/icons/sci-hub-logo.svg`,
    };
    ztoolkit.getGlobal("Zotero").PreferencePanes.register(prefOptions);
  }

  static registerRightClickMenuItem() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/sci-hub-logo.svg`;

    this.popupShowingListener = (event: Event) => {
      const popup = event.target as Element;
      if (popup.id !== "zotero-itemmenu") return;
      // Remove old item if it exists
      const existing = popup.querySelector(`#${this.menuItemId}`);
      if (existing) existing.remove();

      const doc = popup.ownerDocument;
      if (!doc) return;
      const menuitem = doc.createXULElement("menuitem") as XUL.MenuItem;
      menuitem.id = this.menuItemId;
      menuitem.setAttribute("label", getString("menuitem-fetch", "label"));
      menuitem.setAttribute("class", "menuitem-iconic");
      (menuitem as unknown as HTMLElement).style.setProperty("list-style-image", `url(${menuIcon})`);

      const items = Zotero.getActiveZoteroPane()?.getSelectedItems() ?? [];
      const hasRegularItem = items.some((item: Zotero.Item) => item.isRegularItem());
      (menuitem as unknown as HTMLElement).hidden = !hasRegularItem;

      menuitem.addEventListener("command", () => {
        const selectedItems = Zotero.getActiveZoteroPane()?.getSelectedItems() ?? [];
        if (selectedItems.length > 0) {
          SciHubFetcher.updateItems(selectedItems, false).catch((error) => {
            ztoolkit.log(`Fetch PDF error: ${error}`);
          });
        }
      });

      popup.appendChild(menuitem);
    };

    for (const win of Zotero.getMainWindows()) {
      win.document.addEventListener("popupshowing", this.popupShowingListener);
    }
  }

  static unregisterRightClickMenuItem() {
    if (this.popupShowingListener) {
      for (const win of Zotero.getMainWindows()) {
        win.document.removeEventListener("popupshowing", this.popupShowingListener);
        const existing = win.document.getElementById(this.menuItemId);
        if (existing) existing.remove();
      }
      this.popupShowingListener = undefined;
    }
  }
}
