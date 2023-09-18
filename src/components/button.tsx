import { ParentProps } from "solid-js"

type Props = ParentProps

const Button = (props: Props) => {
  return <button type="button">{props.children}</button>
}

export default Button
