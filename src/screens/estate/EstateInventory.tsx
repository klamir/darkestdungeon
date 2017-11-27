import * as React from "react";
import {ItemType} from "../../state/types/ItemInfo";
import {Inventory} from "../../ui/Inventory";
import {StyleSheet} from "aphrodite";
import {observable, transaction} from "mobx";
import {observer} from "mobx-react";
import {CompareFunction, SortOptions} from "../../ui/SortOptions";
import {Item} from "../../state/types/Item";
import {Prompt} from "../../ui/Popups";
import {AppStateComponent} from "../../AppStateComponent";
import {BannerHeader} from "../../ui/BannerHeader";
import {Row} from "../../config/styles";
import {Icon} from "../../ui/Icon";
import {grid} from "../../config/Grid";

const unequipIcon = require(
  "../../../assets/dd/images/campaign/town/realm_inventory/realm_inventory_unequip_trinkets.png"
);
const itemCompareIcons = {
  name: require("../../../assets/dd/images/campaign/town/realm_inventory/realm_inventory_sort_alphabetical.png"),
  type: require("../../../assets/dd/images/campaign/town/realm_inventory/realm_inventory_sort_class.png")
};

@observer
export class EstateInventory extends AppStateComponent {
  @observable compareFn: CompareFunction<Item>;

  async promptUnequipAll () {
    const proceed = await this.appState.popups.prompt(
      <Prompt query="Unequip all items on all heroes?"/>
    );
    if (proceed) {
      this.unequipAllItems();
    }
  }

  unequipAllItems () {
    transaction(() => {
      this.activeProfile.roster.forEach((hero) => {
        while (hero.items.length) {
          this.activeProfile.items.push(hero.items.pop());
        }
      });
    });
  }

  render () {
    return (
      <div>
        <BannerHeader>
          Inventory
        </BannerHeader>
        <Row>
          <Icon
            tip="Unequip items on all heroes"
            classStyle={styles.unequip}
            size={grid.gutter * 3}
            src={unequipIcon}
            onClick={() => this.promptUnequipAll()}
          />
          <SortOptions
            comparers={Item.comparers}
            icons={itemCompareIcons}
            onChange={(compareFn) => this.compareFn = compareFn}
          />
        </Row>
        <Inventory
          heroes={this.activeProfile.roster}
          items={this.activeProfile.items}
          filter={(i) => i.info.type !== ItemType.Heirloom}
        />
      </div>
    );
  }
}

const styles = StyleSheet.create({
  unequip: {
    marginRight: grid.gutter / 2
  }
});
