// Runs twice per job: the main phase records job state, and the post phase (right before
// actions/cache's post-job save, thanks to reverse post ordering) prunes source/build/download
// temp trees from the Conan cache so the saved archive holds usable packages only. Best effort:
// a prune failure must never fail an otherwise green job — the cache is just saved unpruned.
const { existsSync, appendFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");

const isPost = process.env.STATE_isPost === "true";
if (!isPost) {
  // Main phase: stash the Conan home for the post phase through GITHUB_STATE, which post steps
  // receive unconditionally — this keeps the post phase independent of how GITHUB_ENV exports
  // propagate into post steps. CONAN_HOME is in the process env here because the setup action
  // exports it before invoking this action.
  const conanHome = process.env.CONAN_HOME ?? "";
  appendFileSync(process.env.GITHUB_STATE, `isPost=true\nconanHome=${conanHome}\n`);
} else {
  const conanHome = process.env.STATE_conanHome || process.env.CONAN_HOME;
  if (conanHome && existsSync(conanHome)) {
    // Ensure the phase that spawns conan agrees with the phase being pruned.
    process.env.CONAN_HOME = conanHome;
    // No shell: keeps the "*" pattern out of shell glob expansion and quoting differences.
    const result = spawnSync("conan", ["cache", "clean", "*"], { stdio: "inherit" });
    if (result.status !== 0) {
      console.log("warning: conan cache clean failed; the cache will be saved unpruned");
    }
  } else {
    console.log("No Conan cache directory present; nothing to prune.");
  }
}
