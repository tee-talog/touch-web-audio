import { render } from "@solidjs/testing-library"
import { describe, expect, test } from "vitest"
import Button from "./button"
import "@testing-library/jest-dom"

describe("<Button />", () => {
  test("コンポーネントが存在すること", () => {
    const { getByRole } = render(() => <Button>button</Button>)
    expect(getByRole("button")).toBeInTheDocument()
  })
})
