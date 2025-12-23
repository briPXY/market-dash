import { useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { LoadingIcon } from '../Layout/svg';
import { useAppInitStore } from '../stores/stores';

export const ModalSplash = () => {
    const initState = useAppInitStore(state => state.initState);
    const initDone = useAppInitStore(state => state.initDone);

    useEffect(() => {

    }, []);

    return (
        <ModalOverlay isOpen={!initDone} closeFn={() => null}>
            <div className='shadow-lg bg-primary-100 rounded-lg p-5'>
                <div className="flex gap-4 items-center">
                    <div className="text-sm italic">{initState}</div>
                    <LoadingIcon style={{width:14, height:14}}/>
                </div>
            </div>
        </ModalOverlay>
    );
};