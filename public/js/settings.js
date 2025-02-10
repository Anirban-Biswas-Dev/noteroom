async function logout() {
    let result = await Swal.fire({
      icon: 'question',
      title: 'Are you sure you want to logout?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: "#d33",
    })
    if (result.isConfirmed) {
      await db.savedNotes.clear()
      await db.ownedNotes.clear()
      await db.notifications.clear()
      await db.requests.clear()
      window.location.href = '/logout'
    }
}