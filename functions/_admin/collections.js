// The lists /admin shows, one view file per collection in this folder.
// `db add <collection>` writes this file; edit a view's title or columns in
// its own file, not here. A second list on the same table (customers and
// jobs on `records`) is a copy of the view with a `filter`, imported here.
import catalog from "./catalog.js";
import hours from "./hours.js";
import orders from "./orders.js";
export default { catalog, hours, orders };
