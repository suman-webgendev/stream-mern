document.addEventListener("DOMContentLoaded", function () {
  const table = new DataTable("#usersTable", {
    responsive: true,
    ordering: true,
    searching: true,
    paging: true,
    pageLength: 25,
    lengthMenu: [10, 25, 50, 100],
    order: [[0, "desc"]],
  });
});
