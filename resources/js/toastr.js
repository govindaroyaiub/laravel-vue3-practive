import toaster from 'toastr';
import 'toastr/build/toastr.min.css';

export function useToaster(){
    toaster.options.positionClass = 'toast-bottom-right';
    toaster.options.closeButton = true;
    toaster.options.progressBar = true;
    return toaster;
}