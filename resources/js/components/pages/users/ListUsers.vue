<script setup>
    // const users = [];
    import axios from 'axios';
    import { onMounted, ref, reactive, watch } from 'vue';
    import { Form, Field } from 'vee-validate';
    import * as yup from 'yup';
    import { useToaster } from '../../../toastr.js';
    import { debounce } from 'lodash';
    import { Bootstrap4Pagination } from 'laravel-vue-pagination';

    const users = ref({'data': []});
    const editing = ref(false);
    const formValues = ref();
    const form = ref(null);
    const toaster = useToaster();
    const userIdBeingDeleted = ref(null);

    const getUsers = (page = 1) => {
        axios.get(`/api/users?page=${page}`)
            .then((response) => {
                users.value = response.data;
            })
    }

    const createUserSchema = yup.object({
        name: yup.string().required(),
        email: yup.string().email().required(),
        password: yup.string().required().min(8)
    });

    const editUserSchema = yup.object({
        name: yup.string().required(),
        email: yup.string().email().required(),
        password: yup.string().notRequired().test('password', 'Passwords must be be minimum of 8 characters', function(value) {
            if (!!value) {
            const schema = yup.string().min(8);
            return schema.isValidSync(value);
            }
            return true;
        }),
    });

    const createUser = (values, {resetForm, setErrors}) => {
        axios.post(`/api/users`, values)
        .then((response) => {
            users.value.unshift(response.data);
            $('#userFormModal').modal('hide');
            toaster.success('User Created Successfully!');
            resetForm();
        })
        .catch((error) => {
            if(error.response.data.errors){
                setErrors(error.response.data.errors);
            }
        })
    };

    const addUser = () => {
        editing.value = false;
        $('#userFormModal').modal('show');
    }

    const editUser = (user) => {
        editing.value = true;
        form.value.resetForm();
        formValues.value = {
            name: '',
            email: '',
            password: '',
        };
        $('#userFormModal').modal('show');
        formValues.value = {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }

    const updateUser = (values, {setErrors}) => {
        axios.put(`/api/users/` + formValues.value.id, values)
        .then((response) => {
            const index = users.value.findIndex(user => user.id === response.data.id);
            users.value[index] = response.data;
            $('#userFormModal').modal('hide');
            toaster.success('User Updated Successfully!');
            getUsers();
        }).catch((error) => {
            console.log(error);
            setErrors(error.response.data.errors);
        });
    }

    const confirmUserDeletion = (user) => {
        userIdBeingDeleted.value = user.id
        $('#deleteUserModal').modal('show');
    }

    const deleteUser = () => {
        axios.delete(`/api/users/${userIdBeingDeleted.value}`)
        .then(() => {
            $('#deleteUserModal').modal('hide');
            users.value = users.value.filter(user => user.id !== userIdBeingDeleted.value);
            toaster.success('User Deleted Successfully');
        })
    }

    const handleSubmit = (values, actions) => {
        if(editing.value){
            updateUser(values, actions);
        }
        else{
            createUser(values, actions);
        }
    }

    const roles = ref([
        {
            name: 'ADMIN',
            value: 1
        },
        {
            name: 'USER',
            value: 2
        }

    ]);

    const changeRole = (user, role) => {
        axios.patch(`/api/users/${user.id}/change-role`, {
            role: role,
        })
        .then(() => {
            toaster.success('Role changed successfully');
        })
    };

    const searchQuery = ref(null);

    const search = () => {
        axios.get('/api/users/search', {
            params: {
                query: searchQuery.value
            }
        })
        .then(response => {
            users.value = response.data;
        })
        .catch(error => {
            console.log(error);
        })
    }

    watch(searchQuery, debounce(() => {
        search();
    }, 300));

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
            <div class="d-flex justify-content-between">
                <button @click="addUser" type="button" class="mb-4 btn btn-primary">Add New User</button>
                <div>
                    <input type="text" v-model="searchQuery" class="form-control" placeholder="Search......" />
                </div>
            </div>
            
            
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
                <tbody v-if="users.data.length > 0">
                    <tr v-for="(user, index) in users.data" :key="user.id">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.created_at }}</td>
                        <td>
                            <select class="form-control" @change="changeRole(user, $event.target.value)">
                                <option v-for="role in roles" :value="role.value" :selected="(user.role === role.name)">{{ role.name }}</option>
                            </select>
                        </td>
                        <td>
                            <a href="#" @click.prevent="editUser(user)"><i class="fa fa-edit"></i></a>
                            <a href="#" @click.prevent="confirmUserDeletion(user)"><i class="fa fa-trash ml-2 text-danger"></i></a>
                        </td>
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr> <td colspan="6" class="text-center"> No results found...</td></tr>
                </tbody>
            </table>
            <Bootstrap4Pagination class="justify-content-center"
                    :data="users"
                    @pagination-change-page="getUsers"
                />
            <div class="modal fade" id="userFormModal" data-backdrop="static" tabindex="-1" role="dialog"
                aria-labelledby="userFormModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="staticBackdropLabel">
                                <span v-if="editing">Edit User</span>
                                <span v-else>Add User</span>
                            </h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <Form ref="form" @submit="handleSubmit" :validation-schema="editing ? editUserSchema : createUserSchema" v-slot="{errors}" :initial-values="formValues">
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

            <div class="modal fade" id="deleteUserModal" data-backdrop="static" tabindex="-1" role="dialog"
                aria-labelledby="userFormModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="staticBackdropLabel">
                                <span>Delete User</span>
                            </h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <h5>Are you sure you want to delete this user?</h5>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                <button @click.prevent="deleteUser" type="button" class="btn btn-primary">Delete User</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
