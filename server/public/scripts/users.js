document.addEventListener("DOMContentLoaded", function () {
  const table = new DataTable("#usersTable", {
    responsive: true,
    ordering: true,
    searching: true,
    paging: true,
    pageLength: 5,
    lengthMenu: [5, 10, 15, 20],
    order: [[0, "desc"]],
  });
});
