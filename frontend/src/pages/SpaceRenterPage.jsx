import LocalityList from '../components/common/LocalityList';

const SpaceRenterPage = () => {
  return (
    <div className="container mt-4">
      <h1>Space Renter Dashboard</h1>
      <div className="row mt-4">
        <div className="col-12">
          <LocalityList />
        </div>
      </div>
    </div>
  );
};

export default SpaceRenterPage;
