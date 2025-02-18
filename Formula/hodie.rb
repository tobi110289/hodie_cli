require "formula"

class Hodie < Formula
  desc "A productivity CLI suite with Pomodoro timer"
  homepage "https://github.com/tobi11089/hodie_cli"
  url "https://github.com/tobi11089/hodie_cli/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "0019dfc4b32d63c1392aa264aed2253c1e0c2fb09216f8e2cc269bbfb8bb49b5"
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