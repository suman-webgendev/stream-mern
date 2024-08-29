document.addEventListener("DOMContentLoaded", function () {
  const table = new DataTable("#videosTable", {
    responsive: true,
    ordering: true,
    searching: true,
    paging: true,
    pageLength: 25,
    lengthMenu: [10, 25, 50, 100],
    order: [[3, "desc"]],
    columnDefs: [{ targets: 0, orderable: false }],
  });
});
