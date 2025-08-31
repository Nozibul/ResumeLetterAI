'use client';
import { features } from '@/local-data/chooseUS';
import ChooseCard from '../../atoms/chooseCard/ChooseCard';

const ChooseUsLeftSection = () => {
  return (
    <>
      <div className="mt-6">
        {features?.length > 0 ? (
          features.map((item, index) => (
            <div key={item.id} className=" bg-white mb-4">
              <ChooseCard item={item} index={index} />
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
};

export default ChooseUsLeftSection;
