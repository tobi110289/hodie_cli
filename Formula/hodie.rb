require "formula"

class Hodie < Formula
  desc "A productivity CLI suite with Pomodoro timer"
  homepage "https://github.com/yourusername/hodie"
  url "https://github.com/yourusername/hodie/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "REPLACE_WITH_ACTUAL_SHA256"
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