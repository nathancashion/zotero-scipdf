import { config } from "../../package.json";
import { getString, getLocaleID } from "../utils/locale";
import { SciHubFetcher } from "./SciHubFetcher";

export class Common {
  private static menuRegisteredID?: string | false;

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
    this.menuRegisteredID = Zotero.MenuManager.registerMenu({
      menuID: "scipdf-fetch",
      pluginID: config.addonID,
      target: "main/library/item",
      menus: [
        {
          menuType: "menuitem",
          l10nID: getLocaleID("menuitem-fetch"),
          icon: menuIcon,
          onShowing: (_event, context) => {
            const visible = context.items?.some((item: Zotero.Item) => item.isRegularItem()) ?? false;
            context.setVisible(visible);
          },
          onCommand: (_event, context) => {
            if (context.items) {
              SciHubFetcher.updateItems(context.items, false);
            }
          },
        },
      ],
    });
  }

  static unregisterRightClickMenuItem() {
    if (this.menuRegisteredID) {
      Zotero.MenuManager.unregisterMenu(this.menuRegisteredID);
      this.menuRegisteredID = undefined;
    }
  }
}
