require "formula"

class Hodie < Formula
  desc "A productivity CLI suite with Pomodoro timer"
  homepage "https://github.com/tobi11089/hodie_cli"
  url "https://github.com/tobi110289/hodie_cli/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "837a020b91a79a73393fba8070c84a0b667696900d5557955f5f20aaa0ad76e1"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "hodie", shell_output("#{bin}/hodie --help")
  end
end 