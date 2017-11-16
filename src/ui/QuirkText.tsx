import * as React from "react";
import {commonStyles} from "../config/styles";
import {QuirkInfo} from "../state/types/QuirkInfo";
import {TooltipArea} from "../lib/TooltipArea";
import {todo} from "../config/general";

export class QuirkText extends React.Component<{
  quirk: QuirkInfo
}> {
  render () {
    const classStyle = this.props.quirk.isPositive ?
      commonStyles.positiveText :
      commonStyles.negativeText;

    return (
      <TooltipArea tip={todo} classStyle={classStyle}>
        {this.props.quirk.name}
      </TooltipArea>
    );
  }
}
