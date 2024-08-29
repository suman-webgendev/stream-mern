document.addEventListener("DOMContentLoaded", function () {
  const table = new DataTable("#videosTable", {
    responsive: true,
    ordering: true,
    searching: true,
    paging: true,
    pageLength: 5,
    lengthMenu: [5, 10, 15, 20],
    order: [[3, "desc"]],
    columnDefs: [{ targets: 0, orderable: false }],
  });
});
