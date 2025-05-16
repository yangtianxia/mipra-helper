import type { PresetColorType } from './presetColors'
import type { FunctionalColorType } from './functionalColors'

export interface SeedToken extends PresetColorType, FunctionalColorType {
  /**
   * @nameZH 基础文本色
   * @nameEN Seed Text Color
   * @desc 用于派生文本色梯度的基础变量，v5 中我们添加了一层文本色的派生算法可以产出梯度明确的文本色的梯度变量。但**请不要在代码中直接使用该 Seed Token**！
   * @descEN Used to derive the base variable of the text color gradient. In v5, we added a layer of text color derivation algorithm to produce gradient variables of text color gradient. But please do not use this Seed Token directly in the code!
   */
  colorTextBase: string

  /**
   * @nameZH 基础背景色
   * @nameEN Seed Background Color
   * @desc 用于派生背景色梯度的基础变量，v5 中我们添加了一层背景色的派生算法可以产出梯度明确的背景色的梯度变量。但 **请不要在代码中直接使用该 Seed Token** ！
   * @descEN Used to derive the base variable of the background color gradient. In v5, we added a layer of background color derivation algorithm to produce map token of background color. But PLEASE DO NOT USE this Seed Token directly in the code!
   */
  colorBgBase: string

  //  ----------   Font   ---------- //

  /**
   * @nameZH 字体
   * @nameEN FontFamily
   * @desc Ant Design 的字体家族中优先使用系统默认的界面字体，同时提供了一套利于屏显的备用字体库，来维护在不同平台以及浏览器的显示下，字体始终保持良好的易读性和可读性，体现了友好、稳定和专业的特性。
   */
  fontFamily: string

  /**
   * @nameZH 默认字号
   * @nameEN Default Font Size
   * @desc 设计系统中使用最广泛的字体大小，文本梯度也将基于该字号进行派生。
   * @default 14
   */
  fontSize: number

  //  ----------   BorderRadius   ---------- //

  /**
   * @nameZH 基础圆角
   * @nameEN Base Border Radius
   * @descEN Border radius of base components
   * @desc 基础组件的圆角大小，例如按钮、输入框、卡片等
   */
  borderRadius: number

  //  ----------   motion   ---------- //

  /**
   * @nameZH 动画时长变化单位
   * @nameEN Animation Duration Unit
   * @desc 用于控制动画时长的变化单位
   * @descEN The unit of animation duration change
   * @default 100ms
   */
  motionUnit: number

  /**
   * @nameZH 动画基础时长
   */
  motionBase: number

  motionEaseOutCirc: string

  motionEaseInOutCirc: string

  motionEaseInOut: string

  motionEaseOutBack: string

  motionEaseInBack: string

  motionEaseInQuint: string

  motionEaseOutQuint: string

  motionEaseOut: string
}
