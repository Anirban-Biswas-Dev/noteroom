function logout() {
    Swal.fire({
      icon: 'question',
      title: 'Are you sure you want to logout?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: "#d33",
    }).then(result => {
      if (result.isConfirmed) {
        window.location.href = '/logout'
      }
    })
}