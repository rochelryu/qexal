$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();


    $('.notificationBell').click(function() {
        const focus = $(this)
        $.ajax({
            url: '/users/videNotif',
            type: 'post',
            success: function(datas) {
                if (!datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 7000,
                        message: datas.error
                    });
                }
            }
        });
    })
    $('.confirmerDemande').click(function() {

        $('.confirmerDemande').hide()
        $.ajax({
            url: '/users/createDemande',
            type: 'post',
            data: {},
            success: async function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 15000,
                        message: datas.result
                    });

                    window.setTimeout(function() {
                        location.href = location.origin + '/users/suivie';
                    }, 15000);
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 7000,
                        message: datas.error
                    });

                }
            }
        });
    });

    $('.confirmerInscription').click(function() {
        const ref = $(this).attr('data-ref');
        $(this).hide()
        $.ajax({
            url: '/users/confirmerInscription',
            type: 'post',
            data: {
                ref: parseInt(ref, 10)
            },
            success: function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });

                    window.setTimeout(function() {
                        location.href = location.origin + '/users';
                    }, 5000);
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 7000,
                        message: datas.error
                    });

                }
            }
        });
    });

    $('.confirmerLockedInscription').click(function() {
        const ref = $(this).attr('data-ref');
        $(this).hide()
        $.ajax({
            url: '/users/confirmerLockedInscription',
            type: 'post',
            data: {
                ref: parseInt(ref, 10)
            },
            success: function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });

                    window.setTimeout(function() {
                        location.href = location.origin + '/users';
                    }, 5000);
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 7000,
                        message: datas.error
                    });

                }
            }
        });
    });

    $('.confirmReception').click(function() {
        const recoRyu = $(this).attr('data-recov');
        const ref = $(this).attr('data-ref');
        const ele = $(this).attr('data-ele');
        const focus = $(this);
        $.ajax({
            url: '/users/confirmation',
            type: 'post',
            data: {
                recoRyu,
                ref,
                ele
            },
            success: async function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        autoClose: false,
                        message: datas.result
                    });
                    focus.parent().html("<i class='fa fa-check fa-2x'></i>")

                    if (datas.ryu) {
                        const ryu = datas.ryu;
                        const recoRyu = datas.recov;
                        const ref = datas.ref;
                        const demandid = datas.demandid;
                        $.ajax({
                            url: '/users/createDemande2',
                            type: 'post',
                            data: {
                                ryu: parseInt(ryu, 10),
                                recoRyu: parseInt(recoRyu, 10),
                                demandid: parseInt(demandid, 10),
                                ref: parseInt(ref, 10)
                            },
                            success: async function(datas) {
                                if (datas.etat) {
                                    $.notify({
                                        position: 3,
                                        type: 'success',
                                        duration: 15000,
                                        message: datas.result
                                    });

                                    window.setTimeout(function() {
                                        location.href = location.origin + '/users/suivie';
                                    }, 15000);
                                } else {
                                    $.notify({
                                        position: 3,
                                        type: 'error',
                                        duration: 7000,
                                        message: datas.error
                                    });

                                }
                            }
                        });
                    }
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 4000,
                        message: datas.error
                    });
                }
            }
        });
    });

    $('.accordDemande').click(function() {
        const rest = $(this).parent().attr('data-rest');
        const ref = $(this).parent().attr('data-ref');
        const systrouve = $(this).parent().attr('data-systrouve');
        const totalGain = $(this).parent().attr('data-totalGain');
        const focus = $(this);
        $.ajax({
            url: '/users/accordDemande',
            type: 'post',
            data: {
                rest,
                ref,
                systrouve,
                totalGain
            },
            success: async function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });
                    focus.parent().html("<i class='fa fa-check fa-5x'></i>")
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 4000,
                        message: datas.error
                    });
                }
            }
        });
    });

    $('.lockedReception').click(function() {
        const recoRyu = $(this).attr('data-recov');
        const ref = $(this).attr('data-ref');
        const ele = $(this).attr('data-ele');
        const focus = $(this);
        $.ajax({
            url: '/users/lockedReception',
            type: 'post',
            data: {
                recoRyu,
                ref,
                ele
            },
            success: async function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });
                    focus.parent().html("<i class='fa fa-lock fa-2x'></i>")
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 4000,
                        message: datas.error
                    });
                }
            }
        });
    });

    $('.changeReception').click(function() {
        const recoRyu = $(this).attr('data-recov');
        const ref = $(this).attr('data-ref');
        const ele = $(this).attr('data-ele');
        const focus = $(this);
        $.ajax({
            url: '/users/changeReception',
            type: 'post',
            data: {
                recoRyu,
                ref,
                ele
            },
            success: async function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });
                    focus.parent().html("<i class='fa fa-remove fa-2x'></i>")
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 4000,
                        message: datas.error
                    });
                }
            }
        });
    });
    $('.resetDemande').click(function() {
        const ref = $(this).parent().attr('data-ref');
        const ele = $(this).parent();
        $.ajax({
            url: '/users/resetDemande',
            type: 'post',
            data: {
                ref,
            },
            success: async function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });
                    ele.html("Révision de votre demande par le système.")
                    focus.parent().html("<i class='fa fa-check fa-2x'></i>")
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 4000,
                        message: datas.error
                    });
                }
            }
        });
    });
    $('.finishDemande').click(function() {
        const ref = $(this).parent().attr('data-ref');
        const ele = $(this).parent();
        $.ajax({
            url: '/users/finishDemande',
            type: 'post',
            data: {
                ref,
            },
            success: async function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });
                    ele.html("")
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 4000,
                        message: datas.error
                    });
                }
            }
        });
    });

    $('#suivie').submit(function(e) {
        // On empêche le navigateur de soumettre le formulaire
        e.preventDefault();
        const ref = $('#ref').val();
        const tok = $('#tok').val();

        const url = '/users/suivie',
            type = 'post';
        $.ajax({
            url,
            type,
            data: {
                ref,
                tok
            },
            success: function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 10000,
                        message: datas.result
                    });
                    $('#begin').html('<i class="fa fa-check fa-2x"></i>')
                    window.setTimeout(function() {
                        location.href = location.origin + '/users/suivie';
                    }, 10000);
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 8000,
                        message: datas.error
                    });
                }
            }
        });
    });


    $('#loginForm').submit(function(e) {
        // On empêche le navigateur de soumettre le formulaire
        e.preventDefault();
        const ref = $('#ref').val();
        const tok = $('#tok').val();

        const url = '/login',
            type = 'post';
        $.ajax({
            url,
            type,
            data: {
                ref,
                tok
            },
            success: function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 10000,
                        message: datas.result
                    });
                    $('#begin').html('<i class="fa fa-check fa-2x"></i>')
                    window.setTimeout(function() {
                        location.href = location.origin + '/users/suivie';
                    }, 10000);
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 8000,
                        message: datas.error
                    });
                }
            }
        });
    });

    $('#finishSignin').submit(function(e) {
        // On empêche le navigateur de soumettre le formulaire
        e.preventDefault();
        const ref = $('#ref').val().trim();
        const button = $("#validate");
        button.hide();
        $.notify({
            position: 3,
            type: 'info',
            duration: 10000,
            message: "Please wait a few seconds please our robot checks the contract"
        });

        if (ref.length === 64) {
            // $.ajax({
            //     url: 'https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash='+ ref +'&apikey=7HQZ18D5IZ7CC313Y31XTY5GPWC53GR6F8',
            //     type: 'get',
            //     success: function(datas) {
            //         if (datas.result.status == "1") {
            const url = '/users/paycheck',
                type = 'post';
            $.ajax({
                url,
                type,
                data: {
                    ref,
                },
                success: function(datas) {
                    if (datas.etat) {
                        $.notify({
                            position: 3,
                            type: 'success',
                            duration: 10000,
                            message: datas.result
                        });

                        window.setTimeout(function() {
                            location.href = location.origin + '/users/paycheck';
                        }, 10000);
                    } else {
                        $.notify({
                            position: 3,
                            type: 'error',
                            duration: 8000,
                            message: datas.error
                        });
                        button.show();
                    }
                }
            });
            // } else if(datas.result.status == "0") {
            //     $.notify({
            //         position: 3,
            //         type: 'error',
            //         duration: 8000,
            //         message: "Cette transaction a échoué veuillez recommencer."
            //     });
            //     button.show();
            // } 
            // else {
            //   $.notify({
            //     position: 3,
            //     type: 'error',
            //     duration: 8000,
            //     message: "Code de transaction incorrecte"
            // });
            // button.show();
            // }
        }
        // });
        // } 
        else if (ref.length === 64) {
            const url = '/users/paycheck',
                type = 'post';
            $.ajax({
                url,
                type,
                data: {
                    ref,
                },
                success: function(datas) {
                    if (datas.etat) {
                        $.notify({
                            position: 3,
                            type: 'success',
                            duration: 10000,
                            message: datas.result
                        });

                        window.setTimeout(function() {
                            location.href = location.origin + '/users/paycheck';
                        }, 10000);
                    } else {
                        $.notify({
                            position: 3,
                            type: 'error',
                            duration: 8000,
                            message: datas.error
                        });
                        button.show();
                    }
                }
            });
        } else {
            $.notify({
                position: 3,
                type: 'error',
                duration: 8000,
                message: "Code de transaction incorrecte"
            });
            button.show();
        }

    });

    $('#infoGen').submit(function(e) {
        e.preventDefault();
        const name = $('#nameMateriel').val();
        const firstName = $('#firstNameMateriel').val();
        const numberClient = $('#numeroMateriel').val();
        const numberPiece = $('#numeroPieceMateriel').val();
        const password = $('#materialLoginFormPassword').val();
        const addressCrypto = $('#addressEth').val();
        const address = $('#address').val();

        const url = '/users/settings',
            type = 'post';
        $.ajax({
            url,
            type,
            data: {
                name,
                firstName,
                numberClient,
                numberPiece,
                password,
                address,
                addressCrypto,
            },
            success: function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 5000,
                        message: datas.error
                    });
                }
            }
        });
    })

    $('#changePass').submit(function(e) {
        e.preventDefault();
        const oldPass = $('#oldPassword').val();
        const newpass = $('#newPassword').val();
        const confirm = $('#confirmNewPassword').val();

        const url = '/users/setting',
            type = 'post';
        $.ajax({
            url,
            type,
            data: {
                oldPass,
                newpass,
                confirm
            },
            success: function(datas) {
                if (datas.etat) {
                    $.notify({
                        position: 3,
                        type: 'success',
                        duration: 5000,
                        message: datas.result
                    });
                } else {
                    $.notify({
                        position: 3,
                        type: 'error',
                        duration: 5000,
                        message: datas.error
                    });
                }
            }
        });
    })
});