import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders CodeBrew Airways title", () => {
  render(<App />);
expect(
  screen.getByRole("heading", { name: "CodeBrew Airways" })
).toBeInTheDocument();

});
