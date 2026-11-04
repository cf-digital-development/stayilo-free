import { useTemplateRecipe } from '../TemplateProvider.jsx';
import { Stacked } from './Stacked.jsx';

/**
 * Home composition switch. Only `stacked` is implemented; unknown ids
 * use Stacked so content order and wrappers stay as designed.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.hero]
 * @param {import('react').ReactNode} [props.list]
 * @param {import('react').ReactNode} [props.detail]
 * @param {import('react').ReactNode} [props.children]
 */
export function HomeLayout( props ) {
	const recipe = useTemplateRecipe();
	void recipe?.home;
	return <Stacked { ...props } />;
}
