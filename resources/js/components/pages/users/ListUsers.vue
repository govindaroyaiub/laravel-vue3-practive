<script setup>
    // const users = [];
    import axios from 'axios';
    import {
        onMounted,
        ref,
        reactive
    } from 'vue';
    import {
        Form,
        Field
    } from 'vee-validate';
    import * as yup from 'yup';

    const users = ref([]);

    const getUsers = () => {
        axios.get('/api/users')
            .then((response) => {
                users.value = response.data;
            })
    }

    const schema = yup.object({
        name: yup.string().required(),
        email: yup.string().email().required(),
        password: yup.string().required().min(8)
    });

    const createUser = (values, {resetForm}) => {
        axios.post('/api/users', values)
        .then((response) => {
            users.value.push(response.data);
            $('#createUserModal').modal('hide');
            resetForm();
        })
    };

    // const createUser = () => {
    //     axios.post('/api/users', form)
    //         .then((response) => {
    //             users.value.push(response.data);
    //             form.name = '';
    //             form.email = '';
    //             form.password = '';
    //             $('#createUserModal').modal('hide');
    //         })
    // }

    onMounted(() => {
        getUsers();
    });

</script>


<template>
    <div class="content-header">
        <div class="container-fluid">

            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Users</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="#">Home</a></li>
                        <li class="breadcrumb-item active">Users</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <div class="content">
        <div class="container-fluid">
            <button type="button" class="mb-4 btn btn-primary float-right" data-toggle="modal"
                data-target="#createUserModal">Add New</button>
            <table class="table">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Registered Date</th>
                        <th scope="col">Role</th>
                        <th scope="col">Options</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in users" :key="user.id">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
            <div class="modal fade" id="createUserModal" data-backdrop="static" tabindex="-1" role="dialog"
                aria-labelledby="createUserModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="staticBackdropLabel">Add New User</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <Form @submit="createUser" :validation-schema="schema" v-slot="{errors}">
                                <div class="form-group">
                                    <label for="name">Name</label>
                                    <Field name="name" type="text" class="form-control " :class="{'is-invalid': errors.name}" id="name"
                                        aria-describedby="nameHelp" placeholder="Enter full name" />
                                        <span class="invalid-feedback">{{ errors.name }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <Field name="email" type="email" class="form-control " :class="{'is-invalid': errors.email}" id="email"
                                        aria-describedby="nameHelp" placeholder="Enter full email" />
                                        <span class="invalid-feedback">{{ errors.email }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="email">Password</label>
                                    <Field name="password" type="password" class="form-control " :class="{'is-invalid': errors.password}" id="password"
                                        aria-describedby="nameHelp" placeholder="Enter password" />
                                        <span class="invalid-feedback">{{ errors.password }}</span>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save</button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>