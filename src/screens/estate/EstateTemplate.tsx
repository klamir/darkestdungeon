import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {Path, PathTypes} from "../../state/types/Path";
import {PauseMenu} from "../../ui/PauseMenu";
import {EstateRoster} from "./EstateRoster";
import {observer} from "mobx-react";
import {AppStateComponent} from "../../AppStateComponent";
import {InputBindings} from "../../state/InputState";
import {Input} from "../../config/Input";
import {EstateFooter} from "./EstateFooter";
import {commonStyles} from "../../config/styles";
import {Popup} from "../../ui/Popups";
import {ModalState} from "../../state/PopupState";
import {Icon} from "../../ui/Icon";
import {grid} from "../../config/Grid";
import {EstateInventory} from "./EstateInventory";

@observer
export class EstateTemplate extends AppStateComponent<{
  path: Path,
  backPath?: PathTypes,
  continueCheck?: () => Promise<any>,
  continueLabel: string,
  continuePath: PathTypes,
  roster?: boolean,
  inventory?: boolean,
  lineupFeaturesInRoster?: boolean
}> {
  static defaultProps = {
    roster: true,
    inventory: true,
    continueCheck: () => Promise.resolve()
  };

  get mayGoBack () {
    return this.props.backPath;
  }

  pause () {
    this.appState.popups.show(<PauseMenu/>);
  }

  goBack () {
    this.appState.router.goto(this.props.backPath);
  }

  showInventory () {
    this.appState.popups.show({
      id: "inventory",
      modalState: ModalState.Opaque,
      content: (
        <Popup>
          <EstateInventory/>
        </Popup>
      )
    });
  }

  render () {
    const isShowingBuilding = this.props.path.parts.length > 1;
    return (
      <div className={css(commonStyles.fill)}>
        <InputBindings list={[
          [Input.back, () => this.mayGoBack ? this.goBack() : this.pause()]
        ]}/>

        <div className={css(styles.header)}>
          {this.mayGoBack && (
            <Icon
              size={grid.gutter * 3}
              src={require("../../../assets/dd/images/shared/progression/progression_back.png")}
              onClick={() => this.goBack()}
            />
          )}
          {this.activeProfile.name} Estate
        </div>

        <div className={css(styles.content)}>
          {this.props.children}
        </div>

        <EstateFooter
          continueLabel={this.props.continueLabel}
          inventory={this.props.inventory}
          onInventoryRequested={() => this.showInventory()}
          onContinueRequested={() => this.continueToNextScreen()}
          onPauseRequested={() => this.pause()}
        />

        {this.props.roster && (
          <EstateRoster
            lineupFeatures={this.props.lineupFeaturesInRoster}
            portalNode={isShowingBuilding && this.appState.portalNode}
          />
        )}
      </div>
    );
  }

  continueToNextScreen () {
    this.props.continueCheck()
      .then((okToContinue) => {
        if (okToContinue === undefined || okToContinue) {
          this.appState.router.goto(this.props.continuePath);
        }
      });
  }
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0, left: 0,
    flexDirection: "row",
    zIndex: 1
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
