export interface StyleMapToken {
  /**
   * @nameZH XS号圆角
   * @desc XS号圆角，用于组件中的一些小圆角，如 Segmented 、Arrow 等一些内部圆角的组件样式中。
   * @descEN XS size border radius, used in some small border radius components, such as Segmented, Arrow and other components.
   * @default 2
   */
  borderRadiusXS: number
  /**
   * @nameZH SM号圆角
   * @nameEN SM Border Radius
   * @desc SM号圆角，用于组件小尺寸下的圆角，如 Button、Input、Select 等输入类控件在 small size 下的圆角
   * @descEN SM size border radius, used in small size components, such as Button, Input, Select and other input components in small size
   * @default 4
   */
  borderRadiusSM: number
  /**
   * @nameZH LG号圆角
   * @nameEN LG Border Radius
   * @desc LG号圆角，用于组件中的一些大圆角，如 Card、Modal 等一些组件样式。
   * @descEN LG size border radius, used in some large border radius components, such as Card, Modal and other components.
   * @default 8
   */
  borderRadiusLG: number
  /**
   * @default 4
   */
  borderRadiusOuter: number
}
